# Tips:

1. If you want to delete anything from the db: <br>
   `db.getCollection('models').deleteOne({ '\_id': ObjectId('641f87663572567bb81c9e46') })`

2. If you only want to run a specific test suite: <br>
   `jest -t "testSuiteName"`
