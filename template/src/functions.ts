const BASEURL = "http://127.0.0.1:4000";
export function urlConstructor(url: string){
    return `${BASEURL}${url.startsWith('/') ? url : '/' + url}`
}