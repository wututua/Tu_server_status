#!/usr/bin/env python3
"""
测试今日流量重置功能
"""

import sys
import os
import json
from datetime import datetime
import pytz

def test_traffic_reset():
    """测试流量重置功能"""
    
    # 模拟traffic_data.json文件
    traffic_data = {
        "upload_bytes": 1024000000,  # 1GB
        "download_bytes": 2048000000,  # 2GB
        "last_reset_date": "2024-01-01",  # 旧日期
        "last_net_io_bytes_sent": 1024000000,
        "last_net_io_bytes_recv": 2048000000
    }
    
    # 保存测试数据
    with open("test_traffic_data.json", "w", encoding="utf-8") as f:
        json.dump(traffic_data, f, ensure_ascii=False, indent=2)
    
    # 获取当前UTC+8时间
    utc8_tz = pytz.timezone('Asia/Shanghai')
    current_time = datetime.now(utc8_tz)
    today_date = current_time.strftime("%Y-%m-%d")
    
    print("=" * 60)
    print("今日流量重置功能测试")
    print("=" * 60)
    
    print(f"当前UTC+8时间: {current_time}")
    print(f"当前UTC+8日期: {today_date}")
    print(f"测试数据中的最后重置日期: {traffic_data['last_reset_date']}")
    
    # 检查是否需要重置
    if traffic_data["last_reset_date"] != today_date:
        print("✅ 检测到新的一天，需要重置今日流量")
        print(f"重置前数据: 上传 {traffic_data['upload_bytes']} 字节, 下载 {traffic_data['download_bytes']} 字节")
        
        # 重置流量数据
        traffic_data["upload_bytes"] = 0
        traffic_data["download_bytes"] = 0
        traffic_data["last_reset_date"] = today_date
        
        print(f"重置后数据: 上传 {traffic_data['upload_bytes']} 字节, 下载 {traffic_data['download_bytes']} 字节")
        print("✅ 今日流量已重置")
    else:
        print("ℹ️ 当前日期与最后重置日期相同，无需重置")
    
    # 清理测试文件
    if os.path.exists("test_traffic_data.json"):
        os.remove("test_traffic_data.json")
    
    print("=" * 60)
    print("测试完成")
    print("=" * 60)

if __name__ == "__main__":
    test_traffic_reset()