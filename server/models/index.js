const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const config = require('../config/database.json');

const pool = mysql.createPool({
    host: config.host,
    user: config.userName,
    password: config.password,
    database: config.databaseName,
    port: config.port,
    debug: true,
});

const query = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                reject(err);
            } else {
                connection.query(sql, values, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                    connection.release();
                })
            }
        })
    })
}

// 查找用户
exports.getUser = (name, password) => {
    let _sql = `select * from user where user.username="${name}" and user.password="${password}";`;
    return query(_sql);
}

// 获取列表总数
exports.getNoticeTotal = ()=>{
    let _sql = `select count(*) as total from notice`;
    return query(_sql);
}
// 获取公告列表
exports.getNoticeList = ({...values}) =>{
    let start = (values.current-1)*values.pageSize
    let _sql = `select id, title,create_time from notice order by create_time desc limit ${values.pageSize} offset ${start}`;
    return query(_sql);
}
// 保存公告
exports.saveNotice = ({...values}) => {
    let _sql = ''
    let { id, title, content, creator, create_time} = values;
    if(!values.id){
        let filePath = path.join(__dirname, '../data')
        // console.log(filePath, '===============================');
        // 将内容保存至文件
        fs.writeFile(`${filePath}/${create_time}.txt`,`${content}`,function(err){
            if(err){
                return console.error(err);
            }
        });
        _sql = `insert into notice (title, content, creator, create_time) value('${title}', ${create_time}, '${creator}', ${create_time})`;
    } else {
        _sql = `update notice set title=${title},content=${content} where id=${id}`
    }
    return query(_sql)
}
// 删除公告
exports.delNotice=({...values})=>{
    let _sql = `delete from notice where id = ${values.id}`;
    let filePath = path.join(__dirname, '../data');
    fs.unlink(`${filePath}/${values.create_time}.txt`, function(err){
        if(err){
            return console.error(err)
        }
    })
    return query(_sql)
}

// 获取单条公告信息
exports.viewNotice=({...values})=>{
    let _sql =`select * from notice where id = ${values.id}`;
    return query(_sql)
}


// ===================== 课程目录 =======
exports.getDirectory = () =>{
    let _sql = `select * from dtree where id !=1`;
    return query(_sql)
}

exports.handleDirectory = ({...values}) =>{
    let { parent_id, title, type } = values;
    let _sql = `insert into dtree (parent_id, title, type) value(${parent_id}, '${title}',${type}) `;
    return query(_sql)
}

exports.editDirectory=({...values})=>{
    let {id, title} = values;
    let _sql = `update dtree set title='${title}' where id ='${id}'`;
    return query(_sql)
}

exports.delDirectory = ({...values})=>{
    let {id} = values;
    let _sql = `delete from dtree where id ='${id}' or parent_id = '${id}'`;
    return query(_sql)
}

// =================小节课程信息==============
// 获取课程详细信息
exports.getSignalCourseInfo =({...values})=>{
    let {tId} = values;
    let _sql=`select section.*,dtree.title from section,dtree where section.tId = ${tId} and dtree.id = ${tId}`;
    return query(_sql)
}

// 保存课程信息
exports.saveSectionForm = ({...values}) => {
    let {tId,title,description,video,file,hasCourseInfo} = values;
    let _sql= ''
    if(hasCourseInfo){
        _sql = `update section set description='${description}', video='${video}',file='${file}'  where tId=${tId}`;
    } else{
        _sql = `insert into section (tId,title,description,video,file) value(${tId},'${title}','${description}','${video}','${file}')`
    }
   
    return query(_sql)
}

