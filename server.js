const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ใส่ Discord Webhook URL ของเซิร์ฟเวอร์คุณที่นี่
const DISCORD_WEBHOOK_URL = 'YOUR_DISCORD_WEBHOOK_URL_HERE';

// API บันทึกการเข้า-ออกเวร
app.post('/api/shift', async (req, res) => {
    const { adminName, discordId, action, duration } = req.body;
    
    // ตั้งค่าสีและข้อความตาม Action
    const isClockIn = action === 'CLOCK_IN';
    const color = isClockIn ? 0x10B981 : 0xEF4444; // สีเขียว / สีแดง
    const title = isClockIn ? '🟢 เริ่มปฏิบัติหน้าที่ Admin (On-Duty)' : '🔴 สิ้นสุดการปฏิบัติหน้าที่ (Off-Duty)';

    // โครงสร้าง Embed Message ส่งเข้า Discord
    const discordPayload = {
        embeds: [{
            title: title,
            color: color,
            fields: [
                { name: '👤 ชื่อ Admin', value: adminName, inline: true },
                { name: '🆔 Discord ID', value: discordId, inline: true },
                { name: '⏱️ ระยะเวลาทำงาน', value: isClockIn ? 'กำลังทำงาน...' : `${duration} ชั่วโมง`, inline: false }
            ],
            timestamp: new Date().toISOString()
        }]
    };

    try {
        // ยิงข้อความแจ้งเตือนไปที่ Discord
        if (DISCORD_WEBHOOK_URL && DISCORD_WEBHOOK_URL !== 'YOUR_DISCORD_WEBHOOK_URL_HERE') {
            await axios.post(DISCORD_WEBHOOK_URL, discordPayload);
        }

        // TODO: เพิ่มคำสั่ง INSERT ข้อมูลลง Database (MySQL/PostgreSQL) ตรงนี้

        res.status(200).json({ success: true, message: 'บันทึกข้อมูลเรียบร้อยแล้ว' });
    } catch (error) {
        console.error('Error logging shift:', error);
        res.status(500).json({ success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    }
});

app.listen(3000, () => {
    console.log('Backend Server running on port 3000');
});