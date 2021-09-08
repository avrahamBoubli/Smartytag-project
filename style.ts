
export const blueColor = '#0959AC';
export const successColor = '#119274';
export const dangerColor = '#D95350';
export const greyColor = '#F6F6F6';

export const roundButton = {
  backgroundColor: blueColor,
  paddingHorizontal: 14,
  paddingVertical: 7,
  borderRadius: 44
}

export const dangerRoundButton = {
  ...roundButton, backgroundColor: dangerColor
}



export const row = {
  display: 'flex',
  flexDirection: 'row'
}

export const column = {
  display: 'flex',
  flexDirection: 'column'
}

export const rowSpaceBetween = {
  display: 'flex',
  flexDirection: 'row',
  alignSelf: 'stretch',
  justifyContent: 'space-between',
  alignItems: 'center'
}


export const textBold: any = { fontWeight: 'bold' };
export const textBlack: any = { color: '#666' };
