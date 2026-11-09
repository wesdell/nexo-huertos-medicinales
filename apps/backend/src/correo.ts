import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { createTransport } from 'nodemailer';

const APP_URL = process.env.APP_URL ?? 'http://localhost:5173';

/**
 * Envío de correo por SMTP. En desarrollo y en la demo apunta a Mailpit (bandeja en http://localhost:8025),
 * así ningún correo sale a Internet.
 */
@Injectable()
export class CorreoService {
  private readonly log = new Logger('Correo');
  private readonly smtp = createTransport({
    host: process.env.SMTP_HOST ?? 'localhost',
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: false,
    connectionTimeout: 5000,
  });

  async enviar(para: string, asunto: string, texto: string) {
    try {
      await this.smtp.sendMail({ from: process.env.SMTP_FROM ?? 'Nexo MSP <no-responder@nexo.test>', to: para, subject: asunto, text: texto });
    } catch (e) {
      this.log.error(`No se pudo enviar el correo a ${para}: ${(e as Error).message}`);
      throw new ServiceUnavailableException('No se pudo enviar el correo. Revisa el servidor de correo e inténtalo de nuevo.');
    }
  }

  credenciales(para: string, nombre: string, clave: string | null, motivo: string) {
    const acceso = clave
      ? `Usuario: ${para}\nContraseña temporal: ${clave}\n\nAl ingresar por primera vez el sistema te pedirá cambiar la contraseña.`
      : `Ingresa con tu cuenta de siempre (${para}).`;
    return this.enviar(
      para,
      'Nexo: tu acceso como responsable de huerto',
      `Hola, ${nombre}:\n\n${motivo}\n\n${acceso}\n\nIngresa en ${APP_URL}/login\n\nMinisterio de Salud Pública · Nexo Huertos Medicinales`,
    );
  }
}
