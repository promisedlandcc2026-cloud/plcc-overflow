const kaLink = 'https://plcc-chat.vercel.app';
const sanctum = 'https://plcc-sanctum.onrender.com';
const channel = new URLSearchParams(location.search).get('channel')?.trim();

const status = document.querySelector('#status');
const gathering = document.querySelector('#gathering');
const description = document.querySelector('#description');
const back = document.querySelector('#back');
const join = document.querySelector('#join');

function verifiedJoinUrl(result) {
  if (!result.available || result.hearsJordan !== true || typeof result.joinUrl !== 'string') return null;
  const url = new URL(result.joinUrl);
  if (url.origin !== sanctum || !/^\/join\/[^/]+$/.test(url.pathname)) return null;
  url.searchParams.set('from', 'jordan');
  url.searchParams.set('channel', channel);
  return url;
}

if (channel) {
  back.href = `${kaLink}/community/chat/${encodeURIComponent(channel)}`;
  status.textContent = 'Checking availability';
  status.dataset.state = 'checking';

  try {
    const lookup = new URL('/api/overflow', sanctum);
    lookup.searchParams.set('jordanChannelId', channel);
    const response = await fetch(lookup, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('Overflow lookup failed');
    const result = await response.json();
    const url = verifiedJoinUrl(result);
    if (!url) throw new Error('No matching overflow');
    gathering.textContent = typeof result.roomName === 'string' && result.roomName.trim() ? result.roomName : 'Ka Link';
    status.textContent = 'Overflow ready';
    status.dataset.state = 'ready';
    description.textContent = 'Join the overflow for this prayer gathering.';
    join.addEventListener('click', () => location.assign(url));
    join.hidden = false;
  } catch {
    status.textContent = 'Unavailable';
    status.dataset.state = 'unavailable';
    description.textContent = 'Overflow is unavailable for this gathering. Return to Ka Link to try again.';
  }
}
