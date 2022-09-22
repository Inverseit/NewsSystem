/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
class NewsAgency {
  constructor(name) {
    console.log(`Creating a newsAgency with name: ${name}`);
    this.name = name;
  }

  onCreate(id, name, date) {
    console.log(`Noted that article(${id}) with ${name} is created at ${date}`);
  }

  onDelete(id, date) {
    console.log(`Noted that article(${id}) is deleted at ${date}`);
  }

  onUpdate(id, body, date) {
    console.log(
      `Noted that article(${id}) is updated with ${body.toJson()} at ${date}`
    );
  }
}

module.exports = NewsAgency;
