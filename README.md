# Tips:

1. If you want to delete anything from the db: <br>
   `db.getCollection('models').deleteOne({ '\_id': ObjectId('641f87663572567bb81c9e46') })`

2. If you only want to run a specific test suite: <br>
   `jest -t "testSuiteName"`

3. Sometimes, Heroku has problems connecting to mongo atlas because of IP white listing problems <br>
   After fixing the IP in mongo atlas, run this command: <br>
   `heroku restart -a marketing-solution`
