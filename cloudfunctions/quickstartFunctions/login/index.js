const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
// 查询数据库集合云函数入口函数
exports.main = async (event, context) => {
  // 解构 event 对象获取参数值
  const { studentId, studentName } = event.form; 
  // 使用参数进行数据库查询
  const result =  await db.collection('student')
  .where({
    studentId: db.command.eq(studentId),//将输入的字符串类型转为数字类型
    studentName:db.command.eq(studentName)
  })
  .get()
  return result //直接返回记录，让前端判断
};
// 微信id自动登录
exports.openIdLogin = async (event, context) => {
  // 解构 event 对象获取参数值
  const { openId } = event.form; 
  // 使用参数进行数据库查询
  const result =  await db.collection('student')
  .where({
    openId:db.command.all(openId)
  })
  .get()
  return result //直接返回记录，让前端判断
};
// 绑定openid
exports.update = async (event, context) => {
  // 解构 event 对象获取参数值
  const { studentId, studentName, openId } = event.form; 
  // 使用参数进行数据库查询
  const result =  await db.collection('student')
  .where({
    studentId: db.command.eq(studentId),//将输入的字符串类型转为数字类型
    studentName:db.command.eq(studentName)
  })
  .update({
    data: {
      openId: db.command.push(openId[0])
    }
  })
  if(result.stats.updated>0){
    return {data:200}
  }else{
    return result
  }
};


exports.teacherLogin = async (event, context) => {
  console.log("called")
  // 解构 event 对象获取参数值
  const { teacherId, teacherName } = event.form; 
  // 使用参数进行数据库查询
  const result =  await db.collection('teacher')
  .where({
    teacherId: db.command.eq(teacherId),//将输入的字符串类型转为数字类型
    name:db.command.eq(teacherName)
  })
  .get()
  return result //直接返回记录，让前端判断
};

exports.teacherOpenIdLogin = async (event, context) => {
  // 解构 event 对象获取参数值
  const { openId } = event.form; 
  // 使用参数进行数据库查询
  const result =  await db.collection('teacher')
  .where({
    openId:db.command.all(openId)
  })
  .get()
  return result //直接返回记录，让前端判断
};
