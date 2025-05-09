export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      if (url.pathname === '/api/linear') {
        const discord_hook_url = env.DISCORD_HOOK_URL;
        if (!discord_hook_url) throw new Error('Missing DISCORD_HOOK_URL');

        const body = await request.json();

        const action = body.action;
        const type = body.type;
        const issue = body.data?.title || 'Unknown issue';
        const url = body.data?.url || 'No URL';
        const actor = body.actor?.name || 'Someone';
        const team = body.data?.team?.name || '';

        const message = {
          content: `🧩 **Linear Webhook Triggered**`,
          embeds: [
            {
              title: `${action} ${type}`,
              description: `**${issue}**\n${team ? `Team: ${team}` : ''}`,
              url: url,
              footer: {
                text: `By ${actor}`
              },
              timestamp: new Date().toISOString()
            }
          ]
        };

        const discordRes = await fetch(discord_hook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        });

        if (discordRes.ok) {
          return new Response('Message sent to Discord.', { status: 200 });
        } else {
          const errText = await discordRes.text();
          console.error('Discord error:', errText);
          return new Response('Failed to post to Discord', { status: 500 });
        }
      }

      return new Response('Not Found', { status: 404 });
    } catch (err) {
      console.error('Error:', err);
      return new Response(`Worker error: ${err.message}`, { status: 500 });
    }
  }
};
