const getOpenId = require('./getOpenId/index');
const login = require('./login/index');
const index = require('./index/index');


// 云函数入口函数
exports.main = async (event, context) => {
  switch (event.type) {
    case 'getOpenId':
      return await getOpenId.main(event, context);
    case 'login':
      return await login.main(event, context);
    case 'teacherLogin':
      return await login.teacherLogin(event, context);
    case 'bind':
      return await login.update(event, context);
    case 'openIdLogin':
      return await login.openIdLogin(event, context);
    case 'getAnnouncements':
      return await index.getAnnouncements(event, context);
    case 'getClassById':
      return await index.getClassById(event, context);
    case 'getHomeroomTeacherInfoById':
      return await index.getHomeroomTeacherInfoById(event, context);
    case 'appoinmentForHomeroom':
      return await index.appoinmentForHomeroom(event, context);
    case 'createAppoinmentRecordForHomeroom':
      return await index.createAppoinmentRecordForHomeroom(event, context);
    case 'deleteAppoinmentRecordForHomeroom':
      return await index.deleteAppoinmentRecordForHomeroom(event, context);
    case 'getHomeroomAppoinmentInfoById':
      return await index.getHomeroomAppoinmentInfoById(event, context);
    case 'getTeacherList':
      return await index.getTeacherList(event, context);
    case 'getAppoinmentInfoById':
      return await index.getAppoinmentInfoById(event, context);
    case 'createAppoinmentRecord':
      return await index.createAppoinmentRecord(event, context);
    case 'deleteAppoinmentRecord':
      return await index.deleteAppoinmentRecord(event, context);
    case 'homeroomQueryAppointment':
      return await index.homeroomQueryAppointment(event, context);
    case 'superAdmin':
      return await index.superAdmin(event, context);

    // 往下就是老师端用的函数了：）
    case 'teacherOpenIdLogin':
      return await login.teacherOpenIdLogin(event, context);
    case 'teacherGetHrAppointment':
      return await index.teacherGetHrAppointment(event, context);
    case 'teacherGetSubjectAppointment':
      return await index.teacherGetSubjectAppointment(event, context);
  }
};
