const extractImageNameFromUrl = async(imageUrl) => {
    // Split the URL by '/' and get the last part
    const parts = imageUrl.split('/');
    const imageNameWithExtension = parts[parts.length - 1];

    // Remove the file extension (".jpg" in this case)
    const imageName = imageNameWithExtension.split('.')[0];
    return imageName;
}

const paginateQuery = (options) => {
	const limit = options && options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
	const page = options && options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
	const sortOrder = options && options.sortOrder && parseInt(options.sortOrder) ? parseInt(options.sortOrder) : 1;
	const skip = (page - 1) * limit;
	return {
		limit,
		page,
		skip,
		sortOrder
	};
};

const pick = (object, keys) => {
	return keys.reduce((obj, key) => {
		if (object && Object.prototype.hasOwnProperty.call(object, key)) {
			// eslint-disable-next-line no-param-reassign
			obj[key] = object[key];
		}
		return obj;
	}, {});
};

export {
    extractImageNameFromUrl,
    paginateQuery,
	pick,
}
