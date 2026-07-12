import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Envoltura del SDK de S3 apuntando a Cloudflare R2. Si las credenciales no
 * están configuradas, el módulo compila y arranca, pero cualquier subida
 * responde 503 con un mensaje claro (en vez de romper el arranque).
 */
@Injectable()
export class R2Service {
  private readonly client: S3Client | null;
  private readonly bucket: string | undefined;
  private readonly publicUrl: string | undefined;

  constructor(config: ConfigService) {
    const accountId = config.get<string>('R2_ACCOUNT_ID');
    const accessKeyId = config.get<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey = config.get<string>('R2_SECRET_ACCESS_KEY');
    this.bucket = config.get<string>('R2_BUCKET');
    this.publicUrl = config.get<string>('R2_PUBLIC_URL');

    this.client =
      accountId && accessKeyId && secretAccessKey && this.bucket && this.publicUrl
        ? new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: { accessKeyId, secretAccessKey },
          })
        : null;
  }

  get configured(): boolean {
    return this.client !== null;
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<string> {
    if (!this.client || !this.bucket || !this.publicUrl) {
      throw new ServiceUnavailableException(
        'Almacenamiento R2 no configurado (faltan variables R2_*)',
      );
    }
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return `${this.publicUrl.replace(/\/+$/, '')}/${key}`;
  }
}
