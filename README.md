- IF YOU WANT TO DELETE ANYTHING FROM THE DB:
  db.getCollection('models').deleteOne({ '\_id': ObjectId('641f87663572567bb81c9e46') })

- Permissions:
  We are gonna have an array of static permissions in the role model for static elements
  And an array of entity permissions: a new model called "EntityPermission"
  EntityPermission:
  ref to the model
  the permissions: array of basic permissions [Create, Read, Update, Delete]

- Permission:
