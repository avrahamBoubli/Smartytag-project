

export class Parser {
  readonly emptyTagMarker = '000000000000';
  readingStatus = {
    NO_RESPONSE: '3F0203​99A7',
    PENDING: '3F0202556A',
    VALID: '3F0703',
  }

  constructor() { }

  createId(): any {
    let sequence = '';
    let lrc = '';
    do {
      sequence = `3F070200${[...Array(10)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')
        .toUpperCase()}`;
      lrc = this.getLCR(sequence);
    } while (lrc.length !== 2);

    if (lrc.length === 2) {
      return sequence.substr(6, sequence.length);
    }
  }

  xor(a: string, b: string): string {
    return (parseInt(a, 16) ^ parseInt(b, 16)).toString(16).toUpperCase();
  }

  // inserts a white space every 4 chars
  splitTram(tram: string): string[] {
    return tram ? tram.replace(/(.{2})/g, "$1 ").split(' ').filter(v => !!v) : [];
  }


  getLCR(tram: string): string {
    const sequence = this.splitTram(tram);
    let result = this.xor(sequence[0], sequence[1]);
    for (let i = 2; i < sequence.length; i++) {
      result = this.xor(sequence[i], result);
    }
    return result;
  }
  // returns the sequence that corresponds to the id
  getId(tram: string): string {
    // -2 BECAUSE WE WANT TO EXCLUSE LCR
    return tram.substring(6, tram.length - 2);
  }

  isEmpty(tram: string): boolean {
    return tram.toLowerCase().includes(this.emptyTagMarker);
  }

  isPending(payload: string): boolean {
    return payload === '3F0203556B';
  }

  isError(payload: string): boolean {
    return payload.includes('3F020399A7');
  }

  isEncoded(payload: string): boolean {
    return (payload.length > 10)
      && this.isError(payload) === false
      && this.isPending(payload) === false
      && this.isEmpty(payload) === false;
  }

  isValidReading(payload: string): boolean {
    return payload.includes(this.readingStatus.VALID);
  }

  isValidWritingResponse(payload: string) {
    return payload.includes('3F0202013E')
  }

  isValidStolenTag(tagId: string) {
    return this.splitTram(tagId)[0] !== '00';
  }

  // removes the prefix of a stolen tag since all tags are kept in the DB with 00
  normalizeStolenTag(tagId: string) {
    const withoutPrefix = tagId.substr(2, tagId.length);
    return `00${withoutPrefix}`;
  }

}

