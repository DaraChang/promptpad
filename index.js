const express = require('express');
const fs = require('fs');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server);
const filePath = './userData.json';
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

const transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: 'darachang980905@gmail.com',
		pass: 'oset qiep dlmk imdn'
	}
});

const readData = () => {
	if (!fs.existsSync(filePath)) return {};
	const rawData = fs.readFileSync(filePath);
	return JSON.parse(rawData);
};

const writeData = (data) => {
	fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

app.post('/save-data', (req, res) => {
	const { sessionId, user_name, email, task, pre_task_notes} = req.body;

	if (!sessionId || !user_name || !email || !pre_task_notes) {
		return res.status(400).send("Missing required fields");
	}

	const data = readData();

	data[sessionId] = {
		user_name,
		email,
		task,
		pre_task_notes
	};

	writeData(data);
	res.status(200).send("Data saved successfully");
});

app.post("/save-data2", (req, res) => {
	const { sessionId, full_notes } = req.body;
  
	if (!sessionId || !full_notes) {
	  return res.status(400).send("Missing required fields");
	}
  
	const data = readData();
  
	if (!data[sessionId]) {
	  return res.status(404).send("User doesn't exist");
	}
  
	data[sessionId].full_notes = full_notes;
  
	writeData(data);
	res.status(200).send("Data saved successfully");
  });

app.post('/send-email', (req, res) => {
	const { name, email, htmlContent } = req.body;
	const mailOptions = {
		from: 'darachang980905@gmail.com',
		to: 'darachang980905@gmail.com',
		subject: `Report from ${name}`,
		name: name,
		email: email,
		html: `
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <div>${htmlContent}</div>`
	};
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log('Error:', error);
			return res.status(500).send('Error sending email.');
		}
		console.log('Email sent:', info.response);
		res.status(200).send('Email sent successfully.');
	});
});

app.get('/', (req, res) => {
	const mode = req.query.mode;
	if (mode === 'task1_pretask') {
		res.sendFile(join(__dirname, 'index_task1_pretask.html'));
	} else if (mode === 'task1_prompt_pretask') {
		res.sendFile(join(__dirname, 'index_task1_prompt_pretask.html'));
	} else if (mode === 'task1') {
		res.sendFile(join(__dirname, 'index_task1.html'));
	} else if (mode === 'task1_prompt') {
		res.sendFile(join(__dirname, 'index_task1_prompt.html'));
	} else if (mode === 'task2_pretask') {
		res.sendFile(join(__dirname, 'index_task2_pretask.html'));
	} else if (mode === 'task2_prompt_pretask') {
		res.sendFile(join(__dirname, 'index_task2_prompt_pretask.html'));
	} else if (mode === 'task2') {
		res.sendFile(join(__dirname, 'index_task2.html'));
	} else if (mode === 'task2_prompt') {
		res.sendFile(join(__dirname, 'index_task2_prompt.html'));
	} else if (mode === 'test') {
		res.sendFile(join(__dirname, 'index.html'));
	} else {
		res.sendFile(join(__dirname, 'index_send.html'));
	}
});
io.on('connection', (socket) => {
	socket.on('chat message', (msg, num) => {
		io.emit('chat message', { text: msg, senderId: socket.id }, num);
	});
});
server.listen(3000, '0.0.0.0', () => {
	console.log('server running at http://localhost:3000');
});
