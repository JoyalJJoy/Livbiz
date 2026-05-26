import { randomInt } from 'crypto';

const TICKET_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateTicketCode(length = 8) {
  let code = '';

  for (let i = 0; i < length; i += 1) {
    code += TICKET_CODE_CHARS[randomInt(TICKET_CODE_CHARS.length)];
  }

  return code;
}
