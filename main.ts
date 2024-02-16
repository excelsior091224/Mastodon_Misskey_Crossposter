import WebSocket from 'ws';
import axios from 'axios';
import dotenv from 'dotenv';
import FormData from 'form-data';

dotenv.config();

const {
    MASTODON_INSTANCE_HOST,
    MASTODON_USERNAME,
    MASTODON_ACCESS_TOKEN,
    MISSKEY_INSTANCE_URL,
    MISSKEY_ACCESS_TOKEN
} = process.env;

// WebSocket接続を開始
const ws = new WebSocket(`wss://${MASTODON_INSTANCE_HOST}/api/v1/streaming?stream=user&access_token=${MASTODON_ACCESS_TOKEN}`);

ws.on('open', () => {
    console.log('Connected to Mastodon WebSocket');
});

ws.on('error', (error: Error) => {
    console.error('WebSocket error:', error);
});

ws.on('message', async (data: WebSocket.Data) => {
    const response = JSON.parse(data.toString());

    if (response.event === 'update') {
        const payload = JSON.parse(response.payload);

        // 環境変数に設定されたユーザー名と投稿者のユーザー名が一致する場合のみ処理する
        if (payload.account.acct === MASTODON_USERNAME) {
            const content = payload.content.replace(/(<br \/>)/gi, '\n').replace(/(<([^>]+)>)/gi, '').replace(/(&amp;)/gi, '&').replace(/(&lt;)/gi, '<').replace(/(&gt;)/gi, '>').replace(/(&quot;)/gi, '"').replace(/(&#39;)/gi, "'").replace(/(&#x60;)/gi, '`').replace(/(&#169;)/gi, '©');
            const mediaAttachments = payload.media_attachments;
            let mediaIds: string[] = [];

            // 画像が添付されている場合は、先にMisskeyにアップロード
            if (mediaAttachments && mediaAttachments.length > 0) {
                for (const attachment of mediaAttachments) {
                    const mediaId = await uploadMediaToMisskey(attachment.url);
                    if (mediaId) {
                        mediaIds.push(mediaId);
                    }
                }
            }

            // Misskeyに投稿
            postToMisskey(content, mediaIds);
        }
    }
});

// Misskeyに投稿する関数
async function postToMisskey(content: string, mediaIds: string[] = []) {
    try {
        const response = await axios.post(`https://${MISSKEY_INSTANCE_URL}/api/notes/create`, {
            i: MISSKEY_ACCESS_TOKEN,
            text: content,
            ...(mediaIds.length > 0 && { mediaIds: mediaIds })
        });

        if (response.status) {
            console.log('Post to Misskey was successful.');
        } else {
            console.error('Failed to post to Misskey:', response.data);
        }
    } catch (error) {
        console.error('Error posting to Misskey:', error);
    }
}

// Misskeyにメディアをアップロードする関数
async function uploadMediaToMisskey(mediaUrl: string): Promise<string | null> {
    try {
        const mediaResponse = await axios.get(mediaUrl, { responseType: 'arraybuffer' });
        const urlSegments = mediaUrl.split('/');
        const fileName = urlSegments[urlSegments.length - 1];
        const formData = new FormData();
        formData.append('file', mediaResponse.data, {
            filename: fileName,
            contentType: mediaResponse.headers['content-type']
        });
        formData.append('i', MISSKEY_ACCESS_TOKEN);

        const uploadResponse = await axios.post(`https://${MISSKEY_INSTANCE_URL}/api/drive/files/create`, formData, {
            headers: formData.getHeaders()
        });

        if (uploadResponse.status) {
            return uploadResponse.data.id;
        } else {
            console.error('Failed to upload media to Misskey:', uploadResponse.data);
            return null;
        }
    } catch (error) {
        console.error('Error uploading media to Misskey:', error);
        return null;
    }
}
