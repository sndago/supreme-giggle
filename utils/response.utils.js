const successResponse = (res, data, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, data });

const errorResponse = (res, message = 'Server Error', statusCode = 500) =>
  res.status(statusCode).json({ success: false, message });

const paginatedResponse = (res, data, total, page, limit) =>
  res.status(200).json({
    success: true,
    count: data.length,
    total,
    page:       parseInt(page),
    totalPages: Math.ceil(total / limit),
    data,
  });

module.exports = { successResponse, errorResponse, paginatedResponse };
