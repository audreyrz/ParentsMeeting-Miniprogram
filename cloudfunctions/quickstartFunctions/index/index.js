const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();

// 根据班级id获取详细班级信息
exports.getClassById = async (event, context) => {
  // 解构 event 对象获取参数值
  const { grade_id } = event.form; 
  // 使用参数进行数据库查询
  const result =  await db.collection('grade_class')
  .where({
    _id:db.command.eq(grade_id)
  })
  .get()
  return result //直接返回记录，让前端判断
};
//获取通知
exports.getAnnouncements = async (event,context) => {
  const result = await db.collection('announcements').get();
  return result;
};
// 根据班级id获取班主任信息
exports.getHomeroomTeacherInfoById = async (event, context) => {
  // 解构 event 对象获取参数值
  const { grade_id } = event.form; 
  // 使用参数进行数据库查询
  const result =  await db.collection('homeroom_teacher')
  .where({
    grade_id:db.command.eq(grade_id)
  })
  .get()
  return result //直接返回记录，让前端判断
};
// 根据学生id获取预约班主任信息
exports.getHomeroomAppoinmentInfoById = async (event, context) => {
  // 解构 event 对象获取参数值
  const { studentId } = event.form; 
  // 使用参数进行数据库查询
  const result =  await db.collection('homeroom_appointment')
  .where({
    student_id:db.command.eq(studentId)
  })
  .get()
  return result //直接返回记录，让前端判断
};
// 根据学生id获取预约科目老师信息
exports.getAppoinmentInfoById = async (event, context) => {
  // 解构 event 对象获取参数值
  const { studentId } = event.form; 
  // 使用参数进行数据库查询
  const result =  await db.collection('appointment')
  .where({
    student_id:db.command.eq(studentId)
  })
  .get()
  return result //直接返回记录，让前端判断
};
// 预约班主任时间，更新班主任可预约时间字段 ,生成班主任预约记录
exports.appoinmentForHomeroom = async (event, context) => {
  const { _id, indexItem } = event.form;
  
  // 使用参数进行数据库查询
  const result = await db.collection('homeroom_teacher')
    .doc(_id)
    .get();
  
  if (result.data) {
    const available = result.data.available;
    const index = indexItem.currentTimeIndex;
    const selectedTimeIndex = indexItem.selectedTimeIndex;
    if (index >= 0 && index < available.length) {
      // 更新对应位置的值
      //1、计算当前时间段，进行-1计算
      available[index] += -1;
      const availableNumber = available[index]
      if(availableNumber<0||availableNumber>5){ //如果计算超了规定范围，则返回失败
        return { code: 400, message: 'available 超出范围' };
      }
      //2、计算之前时间段
      if(selectedTimeIndex!=-1){//如果存在已选时间段，则进行+1运算
        available[selectedTimeIndex] += 1;
      }
      // 执行更新操作
      const updateResult = await db.collection('homeroom_teacher')
        .doc(_id)
        .update({
          data: {
            available: available
          }
        });
      if (updateResult.stats.updated) {
        return { code: 200, message: '更新成功' };
      } else {
        return { code: 500, message: '更新失败' };
      }
    } else {
      return { code: 400, message: 'index 参数超出范围' };
    }
  } else {
    return { code: 404, message: '未找到对应记录' };
  }
};
// 生成预约记录 - 科目
exports.createAppoinmentRecord= async (event, context) => {
  const appointment = db.collection('appointment');
  try {
    const res = await appointment.add({
      data: {
        student_id: event.form.student_id,
        student_name: event.form.student_name,
        teacher_id: event.form.teacher_id,
        teacher_name: event.form.teacher_name,
        subject: event.form.subject
      }
    });
    return res;
  } catch (err) {
    return err;
  }
}
// 生成预约记录 - 班主任
exports.createAppoinmentRecordForHomeroom = async (event, context) => {
  const homeroom_appointment = db.collection('homeroom_appointment');
  try {
    const res = await homeroom_appointment.add({
      data: {
        // appointment_status: event.form.appointment_status,
        appointment_time: event.form.appointment_time,
        student_id: event.form.student_id,
        student_name: event.form.student_name,
        teacher_id: event.form.teacher_id,
        teacher_name: event.form.teacher_name,
        appointment_index: event.form.appointment_index
      }
    });
    return res;
  } catch (err) {
    return err;
  }
}
// 删除一条预约记录 - 科目
exports.deleteAppoinmentRecord= async (event, context) => {
  const appointment = db.collection('appointment');
  try {
    const res = await appointment.doc(event.form._id).remove();
    return res;
  } catch (err) {
    return err;
  }
}
// 删除一条预约记录 - 班主任
exports.deleteAppoinmentRecordForHomeroom = async (event, context) => {
  const homeroom_appointment = db.collection('homeroom_appointment');
  try {
    const res = await homeroom_appointment.doc(event.form._id).remove();
    return res;
  } catch (err) {
    return err;
  }
}

//获取科目老师列表
exports.getTeacherList = async (event, context) => {
  try {
    const teachers = await db.collection('teacher').get();
    const tabs = [
      { title: '数学', teacherList: [] },
      { title: '英文', teacherList: [] },
      { title: '化学', teacherList: [] },
      { title: '地理', teacherList: [] },
      { title: '历史', teacherList: [] },
      { title: '语文', teacherList: [] },
    ];
    
    teachers.data.forEach(teacher => {
      switch (teacher.subject) {
        case '数学':
          tabs[0].teacherList.push({ name: teacher.name, id: teacher._id, active: false });
          break;
        case '英文':
          tabs[1].teacherList.push({ name: teacher.name, id: teacher._id, active: false });
          break;
        case '化学':
          tabs[2].teacherList.push({ name: teacher.name, id: teacher._id, active: false });
          break;
        case '地理':
          tabs[3].teacherList.push({ name: teacher.name, id: teacher._id, active: false });
          break;
        case '历史':
          tabs[4].teacherList.push({ name: teacher.name, id: teacher._id, active: false });
          break;
        case '语文':
          tabs[5].teacherList.push({ name: teacher.name, id: teacher._id, active: false });
          break;
        default:
          break;
      }
    });
    
    return { data: tabs };
  } catch (err) {
    console.error(err);
    return err;
  }
};


// 因为新建一个文件夹那个switch就找不到了，老师端的云函数就放在这里了：）
exports.teacherGetHrAppointment = async(event, context) => {
  const teacher_name = event.form.teacherName;
  const result =  await db.collection('homeroom_appointment')
  .where({
    teacher_name: db.command.eq(teacher_name)
  })
  .get()
  return result
}

exports.teacherGetSubjectAppointment = async(event, context) => {
  const teacher_name = event.form.teacherName;
  const result =  await db.collection('appointment')
  .where({
    teacher_name: db.command.eq(teacher_name)
  })
  .get()
  return result
}

// 是超级管理员捏☆
exports.superAdmin = async (event, context) => {
  return "是超级管理员捏☆"
}