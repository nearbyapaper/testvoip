class User {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public password: string,
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
  }

  getUserInfo() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
    };
  }

  getUserName() {
    return this.name;
  }
  getUserEmail() {
    return this.email;
  }
  getUserPassword() {
    return this.password;
  }
  getUserId() {
    return this.id;
  }
}
