export const CHECKOUT_REDIRECT_KEY = "worklab-checkout-redirect";
export function getSafeCheckoutRedirect(value:string|null|undefined){if(!value)return"/checkout";try{const decoded=decodeURIComponent(value);return decoded.startsWith("/")&&!decoded.startsWith("//")?decoded:"/checkout"}catch{return"/checkout"}}
