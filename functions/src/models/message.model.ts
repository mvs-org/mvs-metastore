export function ErrorMessage(code: string, message?: string) {
    return {
        message: message,
        code: code
    }
}

export function SuccessMessage(data: any, message?: string) {
    return {
        message: message,
        result: data
    }
}