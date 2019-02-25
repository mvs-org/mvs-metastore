export function checkError(condition: boolean, message: string, returnOnSuccess?: any){
    return new Promise((resolve,reject)=>{
        if(condition)
            resolve(returnOnSuccess)
        else
            reject(Error(message))
    })
}