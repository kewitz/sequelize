var assert = require("assert")
  , config = require("./../config")
  , Sequelize = require("./../../index")
  , sequelize = new Sequelize(config.database, config.username, config.password, {logging: false})

var initUsers = function(num, callback) {
  var User = sequelize.define('User' + parseInt(Math.random() * 99999999), { name: Sequelize.STRING, bio: Sequelize.TEXT })
  var createUser = function() {
    User.create({name: 'user' + num, bio: 'foobar'}).on('success', function(user){
      if(--num) createUser()
      else callback(user, User)
    })
  }
  
  User.sync({force: true}).on('success', function() {
    createUser()
  })
}

module.exports = {
  'all should return all created models': function(exit) {
    initUsers(2, function(_, User) {
      User.all.on('success', function(users) {
        assert.eql(users.length, 2)
        exit()
      })
    })
  },
  'find should return a single model': function(exit) {
    initUsers(2, function(lastInsertedUser, User) {
      User.find(lastInsertedUser.id).on('success', function(user) {
        assert.eql(user.id, lastInsertedUser.id)
        exit()
      })
    })
  },
  'find a specific user': function(exit) {
    initUsers(2, function(_, User) {
      var username = 'user1'
      User.find({where: {name: username}}).on('success', function(user) {
        assert.eql(user.name, username)
        exit()
      })
    })
  },
  'should find no user with invalid conditions': function(exit) {
    initUsers(2, function(_, User) {
      User.find({where: {name: 'foo'}}).on('success', function(user) {
        assert.eql(user, null)
        exit()
      })
    })
  },
  'find should ignore passed limit': function(exit) {
    initUsers(2, function(_, User) {
      User.find({limit: 10}).on('success', function(user) {
        // it returns an object instead of an array
        assert.eql(user.hasOwnProperty('name'), true)
        exit()
      })
    })
  },
  'findAll should find all records': function(exit) {
    initUsers(2, function(_, User) {
      User.findAll().on('success', function(users) {
        assert.eql(users.length, 2)
        exit()
      })
    })
  },
  'findAll should return the correct elements for passed conditions': function(exit) {
    initUsers(2, function(lastUser, User) {
      User.findAll({where: "id != " + lastUser.id}).on('success', function(users) {
        assert.eql(users.length, 1)
        exit()
      })
    })
  },
  'findAll should return the correct order when order is passed': function(exit) {
    initUsers(2, function(lastUser, User) {
      User.findAll({order: "id DESC"}).on('success', function(users) {
        assert.eql(users[0].id > users[1].id, true)
        exit()
      })
    })
  },
  'findAll should handle offset and limit correctly': function(exit) {
    initUsers(10, function(_, User) {
      User.findAll({limit: 2, offset: 2}).on('success', function(users) {
        assert.eql(users.length, 2)
        assert.eql(users[0].id, 3)
        exit()
      })
    })
  }
}