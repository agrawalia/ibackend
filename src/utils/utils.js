const extractImageNameFromUrl = async(imageUrl) => {
    // Split the URL by '/' and get the last part
    const parts = imageUrl.split('/');
    const imageNameWithExtension = parts[parts.length - 1];

    // Remove the file extension (".jpg" in this case)
    const imageName = imageNameWithExtension.split('.')[0];
    return imageName;
}

export {
    extractImageNameFromUrl
}