export function logger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    console[level](
      JSON.stringify({
        type: 'request',
        requestId: req.id,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        ms,
        ts: new Date().toISOString(),
      }),
    );
  });
  next();
}
