import { all, call, put, takeLatest } from 'redux-saga/effects';
import { message } from 'antd';
import { PayloadAction } from 'redux-starter-kit';
import {
  actions as adminActions,
  setRoleAction,
  GetUsersByRoleAction,
  GetBlockedUsersAndIPsAction,
  UnlockUserAndIPAction,
} from './reducer';
import {
  setRole,
  fetchUsersByRole,
  fetchBlockedUsersAndIPs,
  unlockUserAndIP,
} from '../../apis/adminApis';

function* setUserRole(action: PayloadAction<setRoleAction>) {
  try {
    const { username, role } = action.payload;
    if (!username) {
      yield call(message.error, 'Missing Username');
      return;
    }
    yield call(setRole, username, role);
    yield call(message.success, `User ${username} is set to ${role}`);
  } catch (error) {
    yield call(message.error, `setRole Error Received: ${error}`);
  }
}

function* getUsersByRole(action: PayloadAction<GetUsersByRoleAction>) {
  try {
    const { role } = action.payload;
    const data = yield call(fetchUsersByRole, role);
    yield put(adminActions.userRolesReceived({ usersByRole: data }));
  } catch (error) {
    yield call(message.error, `getUsersByRole Error Received: ${error}`);
  }
}

function* getBlockedUsersAndIPs(
    action: PayloadAction<GetBlockedUsersAndIPsAction>
) {
  try {
    const data = yield call(fetchBlockedUsersAndIPs);

    yield put(adminActions.lockedUsersReceived({lockedUsers: data.users}));
    yield put(adminActions.lockedIPsReceived({lockedIPs: data.ips}));
  } catch (error) {
    yield call(message.error, `getBlockedUsersAndIPs Error Received: ${error}`);
  }
}

function* unlockUsersAndIPs(action: PayloadAction<UnlockUserAndIPAction>) {
  const { name, ip } = action.payload;
  try {
    yield call(unlockUserAndIP, name, ip);

    //refresh block users list
    const data = yield call(fetchBlockedUsersAndIPs);
    if (name && name.length > 0)
      yield put(adminActions.lockedUsersReceived({ lockedUsers: data.users }));
    if (ip && ip.length > 0)
      yield put(adminActions.lockedIPsReceived({ lockedIPs: data.ips }));
  } catch (error) {
    yield call(message.error, `unlockUserandIP Error Received: ${error}`);
  }
}

export default function* AdminSagas() {
  yield all([yield takeLatest(adminActions.setRole.type, setUserRole)]);
  yield all([
    yield takeLatest(adminActions.getUsersByRole.type, getUsersByRole),
  ]);
  yield all([
    yield takeLatest(
      adminActions.getBlockedUsersAndIPs.type,
      getBlockedUsersAndIPs
    ),
  ]);
  yield all([
    yield takeLatest(adminActions.unlockUserandIP.type, unlockUsersAndIPs),
  ]);
}