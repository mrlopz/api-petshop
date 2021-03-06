const ValueNotSupported = require("./err/ValueNotSupported");
const jsontoxml = require("jsontoxml");

class Serializer {
  json(data) {
    return JSON.stringify(data);
  }

  xml(data) {
    let tag = this.tagSingular;

    if (Array.isArray(data)) {
      tag = this.tagPlural;
      data = data.map((item) => {
        return {
          [this.tagSingular]: item
        }
      })
    }

    return jsontoxml({ [tag]: data });
  }

  serialize(data) {
    data = this.filter(data);

    if (this.contentType === "application/json") {
      return this.json(data);
    }

    if (this.contentType === "application/xml") {
      return this.xml(data);
    }

    throw new ValueNotSupported(this.contentType);
  }

  filterObject(data) {
    const newObject = {};

    this.publicFields.forEach((field) => {
      if (data.hasOwnProperty(field)) {
        newObject[field] = data[field];
      }
    });

    return newObject;
  }

  filter(data) {
    Array.isArray(data)
      ? (data = data.map((item) => {
          return this.filterObject(item);
        }))
      : (data = this.filterObject(data));
    return data;
  }
}

class SerializerFornecedor extends Serializer {
  constructor(contentType, extraFields) {
    super();
    this.contentType = contentType;
    this.publicFields = ["id", "empresa", "categoria"].concat(
      extraFields || []
    );
    this.tagSingular = "fornecedor";
    this.tagPlural = "fornecedores";
  }
}

class ErrSerializer extends Serializer {
  constructor(contentType, extraFields) {
    super();
    this.contentType = contentType;
    this.publicFields = ["id", "mensagem"].concat(extraFields || []);
    this.tagSingular = "error";
    this.tagPlural = "errors";
  }
}

module.exports = {
  Serializer: Serializer,
  SerializerFornecedor: SerializerFornecedor,
  ErrSerializer: ErrSerializer,
  AcceptFormats: ["application/json", "application/xml"],
};
