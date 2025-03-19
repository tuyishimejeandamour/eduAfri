export function successResponse(data: any, status = 200) {
  return Response.json({ success: true, data }, { status })
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status })
}

