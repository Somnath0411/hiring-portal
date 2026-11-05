// Where each kind of user lands after logging in.
export const homePathFor = (role) => (role === 'admin' ? '/admin' : '/employee')
