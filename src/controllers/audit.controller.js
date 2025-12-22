import * as auditService from "../services/audit.service.js";

export const getAuditLogs = async (req, res) => {
  try {
    // 1. Extracción y Limpieza de Parámetros
    // Usamos valores por defecto seguros para evitar NaN
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { entity, userId, hotelId } = req.query;

    // 2. Validación del hotelId
    // Si llega el string "undefined", "null" o vacío, lo convertimos a undefined real
    let safeHotelId = undefined;
    if (hotelId && hotelId !== 'undefined' && hotelId !== 'null' && hotelId !== '') {
        const parsed = Number(hotelId);
        if (!isNaN(parsed)) {
            safeHotelId = parsed;
        }
    }

    // 3. Validación del userId
    let safeUserId = undefined;
    if (userId && userId !== 'undefined' && userId !== 'null' && userId !== '') {
        const parsedUser = Number(userId);
        if (!isNaN(parsedUser)) {
            safeUserId = parsedUser;
        }
    }

    // 4. Llamada al Servicio
    // IMPORTANTE: Pasamos req.user para que el filtro de seguridad funcione
    const result = await auditService.getAuditLogs(
      { 
        skip, 
        take: limit, 
        entity: entity || undefined, 
        userId: safeUserId, 
        hotelId: safeHotelId 
      },
      req.user
    );

    // 5. Respuesta
    res.json({
      data: result.logs,
      totalCount: result.totalCount,
      page,
      totalPages: Math.ceil(result.totalCount / limit)
    });

  } catch (error) {
    console.error("Error en getAuditLogs:", error);
    // Enviar 500 para errores de servidor, no 400 (a menos que sea validación)
    res.status(500).json({ error: "Error al obtener registros de auditoría." });
  }
};