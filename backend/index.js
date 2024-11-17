require('dotenv').config({ path: '../.env' });
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

const bcrypt = require('bcrypt');

const { format, startOfWeek, addDays } = require('date-fns');

const diasDaSemana = {
  'segunda': 0,
  'terça': 1,
  'quarta': 2,
  'quinta': 3,
  'sexta': 4,
  'sábado': 5,
  'domingo': 6,
};

function getWeekDates() {
  const today = new Date();
  const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 2 });

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(startOfCurrentWeek, i);
    weekDates.push(format(date, 'yyyy-MM-dd'));
  }
  return weekDates;
}

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log('Conectado ao MySQL');
});

//criar usuário
app.post('/register', async (req, res) => {
    const { username, email, password, address, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (name, email, password, address, phone) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [username, email, hashedPassword, address, phone], (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    });
  });

  //checar usuário tentando logar
  app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [username], async (err, results) => {
      if (err) return res.status(500).json({ error: err });
      
      if (results.length > 0) {
        const user = results[0];
        
        const match = await bcrypt.compare(password, user.password);
        
        if (match) {
          res.json({ success: true, user });
        } else {
          res.json({ success: false, message: 'Senha incorreta' });
        }
      } else {
        res.json({ success: false, message: 'Usuário não encontrado' });
      }
    });
  });

  //buscar usuário por id
  app.get('/api/user/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM users WHERE id = ?';
    db.query(query, [id], (err, results) => {
      const user = results[0];
      if (err) return res.status(500).send('Erro ao carregar usuário');
      res.json({ success: true, user });
    });
  });

//criar encomenda
app.post('/api/orders', (req, res) => {
  const { user_id, delivery_at, items } = req.body;
  if (!user_id || !delivery_at || !items || items.length === 0) {
    return res.status(400).send('Dados inválidos');
  }

  // Calcular o total_value do pedido
  let totalValue = 0;
  const itemsIds = [];
  items.forEach(item => {
    const { productId, quantity } = item;
    if (productId && quantity) {
      const query = 'SELECT price FROM products WHERE id = ?';
      db.query(query, [productId], (err, results) => {
        if (err) return res.status(500).send('Erro ao calcular o valor total');
        const product = results[0];
        if (product) {
          totalValue += product.price * quantity;
          itemsIds.push({ productId, quantity });
        } else {
          return res.status(400).send('Produto não encontrado');
        }
      });
    }
  });

  // Inserir o pedido na tabela 'orders'
  const queryOrder = 'INSERT INTO orders (user_id, calendar_id, status, total_value, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)';
  db.query(queryOrder, [user_id, delivery_at, 'Pendente', totalValue], (err, orderResult) => {
    if (err) return res.status(500).send('Erro ao criar o pedido');

    // Salvar os itens na tabela 'items'
    const orderId = orderResult.insertId;
    itemsIds.forEach(item => {
      const queryItem = 'INSERT INTO items (order_id, product_id, quantity) VALUES (?, ?, ?)';
      db.query(queryItem, [orderId, item.productId, item.quantity], (err) => {
        if (err) return res.status(500).send('Erro ao adicionar itens ao pedido');
      });
    });

    res.status(201).send('Pedido criado com sucesso');
  });
});

//listar encomendas
app.get('/api/orders', (req, res) => {
  const query = `
    SELECT 
      o.id AS order_id, 
      o.user_id, 
      u.name AS user_name, 
      u.address AS user_address,
      o.status, 
      o.total_value, 
      o.calendar_id, 
      DATE_FORMAT(o.delivered_at, '%d/%m/%Y') AS delivered_at,
      i.product_id, 
      i.quantity, 
      p.name AS product_name, 
      p.price AS product_price,
      oc.day,
      oc.shift
    FROM 
      orders o
    JOIN 
      users u ON o.user_id = u.id
    JOIN 
      items i ON o.id = i.order_id
    JOIN 
      products p ON i.product_id = p.id
    JOIN
      orders_calendar oc on o.calendar_id = oc.id  
    ORDER BY 
      o.id DESC;
  `;
  
  db.query(query, (err, results) => {
    if (err) return res.status(500).send(err);
    
    const today = new Date();
    const weekDates = getWeekDates(today);

    const updatedResults = results.map((item) => {
      const dayOffset = diasDaSemana[item.day.toLowerCase()];
      const orderDate = weekDates[dayOffset];
      const formattedDate = format(orderDate, 'dd/MM/yyyy')

      return {
        ...item,
        day: formattedDate,
      };
    });

    res.status(200).send(updatedResults);
  });
});

//buscar encomendas por usuário
app.get('/api/my-orders/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      o.id AS order_id,  
      o.status, 
      o.total_value, 
      o.calendar_id, 
      DATE_FORMAT(o.delivered_at, '%d/%m/%Y') AS delivered_at,
      i.product_id, 
      i.quantity, 
      p.name AS product_name, 
      p.price AS product_price,
      oc.day,
      oc.shift
    FROM 
      orders o
    JOIN 
      items i ON o.id = i.order_id
    JOIN 
      products p ON i.product_id = p.id
    JOIN
      orders_calendar oc on o.calendar_id = oc.id  
    WHERE
      o.user_id = ?  
    ORDER BY 
      o.id DESC;
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send('Erro ao carregar encomenda');
    const today = new Date();
    const weekDates = getWeekDates(today);

    const updatedResults = results.map((item) => {
      const dayOffset = diasDaSemana[item.day.toLowerCase()];
      const orderDate = weekDates[dayOffset];
      const formattedDate = format(orderDate, 'dd/MM/yyyy')

      return {
        ...item,
        day: formattedDate,
      };
    });

    res.status(200).send(updatedResults);
  });
});

// buscar encomenda por id
app.get('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT 
      o.id AS order_id, 
      o.user_id, 
      DATE_FORMAT(o.created_at, '%d/%m/%Y') AS created_at,
      u.name AS user_name,
      u.email,
      u.phone, 
      u.address AS user_address,
      o.status, 
      o.total_value, 
      o.calendar_id, 
      DATE_FORMAT(o.delivered_at, '%d/%m/%Y') AS delivered_at,
      i.product_id, 
      i.quantity, 
      p.name AS product_name, 
      p.price AS product_price,
      oc.day,
      oc.shift
    FROM 
      orders o
    JOIN 
      users u ON o.user_id = u.id
    JOIN 
      items i ON o.id = i.order_id
    JOIN 
      products p ON i.product_id = p.id
    JOIN
      orders_calendar oc on o.calendar_id = oc.id  
    WHERE
      o.id = ?  
    ORDER BY 
      o.id DESC;
  `;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).send('Erro ao carregar encomenda');
    const today = new Date();
    const weekDates = getWeekDates(today);

    const updatedResults = results.map((item) => {
      const dayOffset = diasDaSemana[item.day.toLowerCase()];
      const orderDate = weekDates[dayOffset];
      const formattedDate = format(orderDate, 'dd/MM/yyyy')

      return {
        ...item,
        day: formattedDate,
      };
    });

    res.status(200).send(updatedResults);
  });
});

// atualizar status da encomenda
app.put('/api/orders/:orderId', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  var query = `
    UPDATE orders
    SET status = ?
  `;

  if(status === 'Entregue') {
    query += `, delivered_at = CURRENT_TIMESTAMP `;
  }

  query += `WHERE id = ?`;

  db.query(query, [status, orderId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: 'Erro ao atualizar o status.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).send({ message: 'Encomenda não encontrada.' });
    }

    return res.status(200).send({ message: 'Status da encomenda atualizado com sucesso!' });
  });
});

// listar produtos
app.get('/api/products', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) return res.status(500).send(err);
    res.status(200).send(results);
  });
});

// listar produtos ativos
app.get('/api/active-products', (req, res) => {
  const query = 'SELECT * FROM products WHERE active = 1';
  db.query(query, (err, results) => {
    if (err) return res.status(500).send('Erro ao carregar os produtos');
    res.status(200).json(results);
  });
});

// criar produto
app.post('/api/products', (req, res) => {
  const { name, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios.' });
  }

  const query = 'INSERT INTO products (name, price, active) VALUES (?, ?, 1)';
  db.query(query, [name, price], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: 'Produto criado com sucesso!', id: result.insertId });
  });
});

// editar produto
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, active } = req.body;
  const query = 'UPDATE products SET name = ?, price = ?, active = ? WHERE id = ?';
  db.query(query, [name, price, active, id], (err) => {
    if (err) return res.status(500).send(err);
    res.status(200).send({ message: 'Produto atualizado' });
  });
});

// excluir produto
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM products WHERE id = ?';
  db.query(query, [id], (err) => {
    if (err) return res.status(500).send(err);
    res.status(200).send({ message: 'Produto excluído' });
  });
});

// listar dias de entrega
app.get('/api/delivery-days', (req, res) => {
  const weekDates = getWeekDates();
  db.query('SELECT * FROM orders_calendar', (err, results) => {
    if (err) return res.status(500).send(err);
    const daysWithDates = results.map((item) => {
      const dayIndex = diasDaSemana[item.day];
      const dayDate = weekDates[dayIndex];

      return {
        ...item,
        date: dayDate,
        formattedDate: format(new Date(dayDate), 'dd/MM/yyyy'),
      };
    });
    res.status(200).send(daysWithDates);
  });
});

// listar dias de entrega disponíveis
app.get('/api/active-delivery-days', (req, res) => {
  const weekDates = getWeekDates();
  db.query('SELECT * FROM orders_calendar WHERE active = 1', (err, results) => {
    if (err) return res.status(500).send(err);
    const daysWithDates = results.map((item) => {
      const dayIndex = diasDaSemana[item.day];
      const dayDate = weekDates[dayIndex];

      return {
        ...item,
        date: dayDate,
        formattedDate: format(new Date(dayDate), 'dd/MM/yyyy'),
      };
    });
    res.status(200).send(daysWithDates);
  });
});

// ativar/desativar dia de entrega
app.put('/api/delivery-days/:id', (req, res) => {
  const { id } = req.params;
  const selectQuery = 'SELECT active FROM orders_calendar WHERE id = ?';
  
  db.query(selectQuery, [id], (err, results) => {
    if (err) return res.status(500).send(err);
    
    if (results.length === 0) {
      return res.status(404).send({ message: 'Dia de entrega não encontrado' });
    }
    const currentActiveStatus = results[0].active;
    const newActiveStatus = currentActiveStatus === 1 ? 0 : 1;
    const updateQuery = 'UPDATE orders_calendar SET active = ? WHERE id = ?';

    db.query(updateQuery, [newActiveStatus, id], (err) => {
      if (err) return res.status(500).send(err);
      res.status(200).send({ message: 'Status do dia de entrega alterado com sucesso' });
    });
  });
});

const PORT = process.env.DB_PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando em ${process.env.DB_HOST}:${PORT}`);
});