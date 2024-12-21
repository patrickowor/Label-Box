const BASEURL = "https://label-box.onrender.com";
export function urlConstructor(url: string){
    return `${BASEURL}${url.startsWith('/') ? url : '/' + url}`
}