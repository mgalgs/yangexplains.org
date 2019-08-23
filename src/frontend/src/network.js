/**
 * GET some data
 * returns JSON
 */
async function yangGet(url) {
    const result = await fetch(url, {credentials: 'same-origin'});
    return [await result.json(), result];
}

/**
 * POST some data
 * returns a 2-tuple with [json_response, response]
 * https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
 */
async function yangPost(url = '', data = {}) {
  // Default options are marked with *
    const res = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
        },
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return [await res.json(), res];
}

export { yangGet, yangPost };
