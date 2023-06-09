export const blobToBase64 = (blob: Blob) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
            resolve(reader.result);
        };
    });
};

export const waitTwoSeconds = () => {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve();
        }, 2000);
    });
}
