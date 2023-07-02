const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const PORT = 3000;

// MongoDBへの接続
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDBに接続しました');
  })
  .catch((err) => {
    console.error('MongoDBへの接続に失敗しました', err);
  });

// モデルの定義
const User = mongoose.model('User', {
  name: String
});

app.use('/public', express.static('public'));
app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
  res.render('index', { title: 'タイトルです' });
});

app.get('/users', (req, res) => {
  User.find()
    .then(users => {
      res.render('users/index', { users });
    })
    .catch(err => {
      console.error('ユーザーの取得に失敗しました', err);
      res.status(500).send('ユーザーの取得に失敗しました');
    });
});

app.post('/api/users', (req, res) => {
  const user = new User({
    name: req.body.name
  });

  user.save()
    .then(() => {
      res.redirect('/users');
    })
    .catch(err => {
      console.error('ユーザーの保存に失敗しました', err);
      res.status(500).send('ユーザーの保存に失敗しました');
    });
});

app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  User.findById(id)
    .then(user => {
      if (!user) {
        res.status(404).send('指定されたユーザーが見つかりません');
      } else {
        res.render('users/show', { user });
      }
    })
    .catch(err => {
      console.error('ユーザーの取得に失敗しました', err);
      res.status(500).send('ユーザーの取得に失敗しました');
    });
});

app.get('/users/:id/edit', (req, res) => {
  const { id } = req.params;
  User.findById(id)
    .then(user => {
      if (!user) {
        res.status(404).send('指定されたユーザーが見つかりません');
      } else {
        res.render('users/edit', { user });
      }
    })
    .catch(err => {
      console.error('ユーザーの取得に失敗しました', err);
      res.status(500).send('ユーザーの取得に失敗しました');
    });
});

app.patch('/api/users/:id/edit', (req, res) => {
  const { id } = req.params;
  const newName = req.body.name;
  User.findByIdAndUpdate(id, { name: newName })
    .then(() => {
      res.redirect('/users');
    })
    .catch(err => {
      console.error('ユーザーの更新に失敗しました', err);
      res.status(500).send('ユーザーの更新に失敗しました');
    });
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  User.findByIdAndDelete(id)
    .then(() => {
      res.redirect('/users');
    })
    .catch(err => {
      console.error('ユーザーの削除に失敗しました', err);
      res.status(500).send('ユーザーの削除に失敗しました');
    });
});

function logger(req, res, next) {
  console.log(req.originalUrl);
  next();
}

app.listen(PORT, () => {
  console.log('サーバーが起動しました');
});
