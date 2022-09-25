const getDeviceMac = () => {
	//获取本机Mac地址
	var deviceMac = '';
	var net = plus.android.importClass('java.net.NetworkInterface');
	var wl0 = net.getByName('wlan0');
	var macByte = wl0.getHardwareAddress();
	deviceMac = '';
	for (var i = 0; i < macByte.length; i++) {
		var tmp = '';
		var num = macByte[i];
		if (num < 0) {
			tmp = (255 + num + 1).toString(16);
		} else {
			tmp = num.toString(16);
		}
		if (tmp.length == 1) {
			tmp = '0' + tmp;
		}
		deviceMac += tmp;
	}
	return deviceMac;
}

export {
	getDeviceMac
}