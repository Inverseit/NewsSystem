const EventEmitter = require("events");
const { CREATED, DELETED, UPDATED } = require("./events");

class ArticleManager extends EventEmitter {
  constructor(listenersMap) {
    super();
    this.listenersMap = listenersMap;
  }

  created(id, name) {
    this.emit(CREATED, id, name, Date.now());
  }

  deleted(id) {
    this.emit(DELETED, id, Date.now());
  }

  updated(id, body) {
    this.emit(UPDATED, id, body, Date.now());
  }

  addNewsAgency(listener) {
    this.on(CREATED, listener.onCreate);
    this.on(UPDATED, listener.onUpdate);
    this.on(DELETED, listener.onDelete);
    this.listenersMap.set(listener.name, listener);
  }

  removeNewsAgency(listener) {
    this.off(CREATED, listener.onCreate);
    this.off(UPDATED, listener.onUpdate);
    this.off(DELETED, listener.onDelete);
    this.listenersMap.delete(listener.name);
  }
}

module.exports = ArticleManager;
