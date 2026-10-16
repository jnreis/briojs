const prefix = '/__brio_http__/';

export function httpFixtures(request, response, next) {
    const url = new URL(request.url, 'http://localhost');
    if (!url.pathname.startsWith(prefix)) return next();
    const name = url.pathname.slice(prefix.length);
    response.setHeader('Cache-Control', 'no-store');
    const send = (status, contentType, body) => {
        response.writeHead(status, { 'Content-Type': contentType });
        response.end(body);
    };
    if (name === 'echo') {
        const chunks = [];
        request.on('data', chunk => chunks.push(chunk));
        request.on('end', () => {
            const body = Buffer.concat(chunks);
            send(200, 'application/json', JSON.stringify({
                method: request.method,
                query: [...url.searchParams],
                contentType: request.headers['content-type'] ?? null,
                demoHeader: request.headers['x-brio-demo'] ?? null,
                body: body.toString('utf8'),
                bytes: [...body],
            }));
        });
    } else if (name === 'json' || name === 'problem-json') {
        send(200, name === 'json' ? 'application/json' : 'application/problem+json', '{"message":"Hello from the local fixture"}');
    } else if (name === 'text-json') {
        send(200, 'text/plain', '{"message":"JSON sent as text/plain"}');
    } else if (name === 'empty-json') {
        send(200, 'application/json', '');
    } else if (name === 'empty-text') {
        send(200, 'text/plain', '');
    } else if (name === 'no-content' || name === 'reset-content') {
        send(name === 'no-content' ? 204 : 205, 'application/json', undefined);
    } else if (name === 'invalid-json') {
        send(200, 'application/json', '{not valid JSON');
    } else if (name === 'form') {
        send(200, 'application/x-www-form-urlencoded', 'name=Ada&tag=js&tag=html');
    } else if (name === 'error') {
        send(422, 'application/problem+json', '{"title":"Demo validation failed","field":"email"}');
    } else if (name === 'slow') {
        const timer = setTimeout(() => send(200, 'application/json', '{"finished":true}'), 2000);
        response.on('close', () => clearTimeout(timer));
    } else {
        send(404, 'text/plain', 'Unknown HTTP demo fixture');
    }
}
