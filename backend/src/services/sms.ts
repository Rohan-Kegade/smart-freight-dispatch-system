import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const snsClient = new SNSClient({ region: process.env.AWS_REGION ?? 'ap-south-1' });

// Normalize any phone format to E.164 (SNS requirement)
// '+91-9876543210' → '+919876543210'
function toE164(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

export async function sendSms(phoneNumber: string, message: string): Promise<void> {
  const normalized = toE164(phoneNumber);

  // In non-production environments there are no IAM credentials — log instead.
  // ECS Fargate in production picks up credentials from the task's IAM role automatically.
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[SMS] To: ${normalized}\n${message}`);
    return;
  }

  await snsClient.send(
    new PublishCommand({
      PhoneNumber: normalized,
      Message: message,
      MessageAttributes: {
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional', // guaranteed delivery, not promotional
        },
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: 'FreightCo', // visible on the driver's phone
        },
      },
    }),
  );
}
