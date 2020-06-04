const express= require('express');
const path = require('path');
const cors=require('cors');
const app=express();
const bodyParser=require("body-parser");
const port = process.env.PORT || 4321;

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const CustomerRoutes=require('./api/routes/customerRoutes');
const AdminRoutes=require('./api/routes/adminRoutes');
const StudentRoutes= require('./api/routes/studentRoutes');
const TeacherRoutes= require('./api/routes/teacherRoutes');
app.use('/admin',AdminRoutes);
app.use('/customer',CustomerRoutes);
app.use('/student',StudentRoutes);
app.use('/teacher',TeacherRoutes);
app.use('**',express.static(path.join(__dirname, 'public/index.html')));



app.listen(port);