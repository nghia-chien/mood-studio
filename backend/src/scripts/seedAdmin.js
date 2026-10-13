import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db.js';
import { env, validateEnv } from '../config/env.js';
import { Admin } from '../modules/admin/admin.model.js';
import { Concept } from '../modules/concepts/concept.model.js';
import { Package } from '../modules/packages/package.model.js';
import { GalleryImage } from '../modules/gallery/gallery.model.js';

validateEnv();

async function runSeed() {
  const connected = await connectDB();
  if (!connected) {
    console.error('Cannot seed: Database not connected.');
    process.exit(1);
  }

  try {
    const adminEmail = (env.ADMIN_EMAIL || 'admin@moodstu.com').toLowerCase().trim();
    const adminPassword = env.ADMIN_PASSWORD || 'Admin@123456';

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await Admin.create({
        email: adminEmail,
        passwordHash,
        role: 'admin'
      });
      console.log(`[SEED] Admin account created successfully for: ${adminEmail}`);
    } else {
      console.log(`[SEED] Admin account already exists for: ${adminEmail}`);
    }

    // Check if initial sample concepts exist for development testing
    const count = await Concept.countDocuments();
    if (count === 0) {
      console.log('[SEED] Seeding sample concepts and packages for development verification...');

      const concept1 = await Concept.create({
        name: 'Concept Nàng Thơ Pastel',
        slug: 'concept-nang-tho-pastel',
        shortDescription: 'Phong cách nữ tính, thanh lịch với tone màu hồng pastel và trắng kem đặc trưng của MOOD Studio.',
        description: 'Bộ ảnh concept nghệ thuật dành cho các bạn nữ yêu thích sự nhẹ nhàng, thơ mộng. Studio chuẩn bị sẵn bối cảnh hoa, trang phục váy ren và ánh sáng mềm.',
        coverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
        category: 'personal',
        status: 'PUBLISHED',
        displayOrder: 1
      });

      const concept2 = await Concept.create({
        name: 'Concept Cổ Trang Cung Đình',
        slug: 'concept-co-trang-cung-dinh',
        shortDescription: 'Tái hiện nét đẹp truyền thống và cổ điển qua trang phục Việt phục và phong cách trang điểm tinh xảo.',
        description: 'Concept mang phong cách cổ trang Việt Nam với cổ phục chất lượng cao, bối cảnh mộc mạc và phụ kiện chỉn chu.',
        coverImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80',
        category: 'traditional',
        status: 'PUBLISHED',
        displayOrder: 2
      });

      const concept3 = await Concept.create({
        name: 'Concept Chân Dung Tối Giản',
        slug: 'concept-chan-dung-toi-gian',
        shortDescription: 'Tập trung vào biểu cảm, ánh mắt và cảm xúc chân thật với phông nền studio tối giản.',
        description: 'Chụp ảnh chân dung nghệ thuật cá nhân, làm nổi bật đường nét tự nhiên và cá tính của khách hàng.',
        coverImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80',
        category: 'portrait',
        status: 'PUBLISHED',
        displayOrder: 3
      });

      // Sample packages
      await Package.create([
        {
          conceptId: concept1._id,
          name: 'Gói Nàng Thơ Basic',
          description: 'Gói chụp cơ bản cho 1 người, bao gồm 1 trang phục và make-up nhẹ nhàng.',
          price: 1500000,
          includedItems: ['1 layout make-up & làm tóc', '1 bộ trang phục concept', 'Trả toàn bộ ảnh gốc', 'Chỉnh sửa 10 ảnh chất lượng cao'],
          status: 'ACTIVE',
          displayOrder: 1
        },
        {
          conceptId: concept1._id,
          name: 'Gói Nàng Thơ Premium',
          description: 'Gói chụp cao cấp với 2 trang phục, bối cảnh hoa tươi và photobook kỷ niệm.',
          price: 2800000,
          includedItems: ['2 layout make-up & làm tóc', '2 bộ trang phục concept', 'Bối cảnh hoa tươi thiết kế riêng', 'Trả toàn bộ ảnh gốc', 'Chỉnh sửa 20 ảnh cao cấp', 'Tặng 1 ảnh ép gỗ để bàn'],
          status: 'ACTIVE',
          displayOrder: 2
        },
        {
          conceptId: concept2._id,
          name: 'Gói Cổ Trang Hoài Niệm',
          description: 'Trải nghiệm cổ phục Việt cao cấp với chuyên gia tạo mẫu tóc và trang điểm phong cách cổ điển.',
          price: 2200000,
          includedItems: ['Trang phục cổ phục cao cấp', 'Trang điểm và làm tóc phong cách cổ điển', 'Trả toàn bộ ảnh gốc', 'Chỉnh sửa 15 ảnh nghệ thuật'],
          status: 'ACTIVE',
          displayOrder: 1
        },
        {
          conceptId: concept3._id,
          name: 'Gói Chân Dung Studio',
          description: 'Gói chân dung cá nhân phong cách nghệ thuật tối giản.',
          price: 1200000,
          includedItems: ['Make-up tự nhiên', 'Chụp trong studio phông trơn', 'Trả toàn bộ ảnh gốc', 'Chỉnh sửa 8 ảnh chân dung'],
          status: 'ACTIVE',
          displayOrder: 1
        }
      ]);

      // Sample gallery images
      await GalleryImage.create([
        {
          conceptId: concept1._id,
          imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
          publicId: 'sample_pastel_1',
          caption: 'Bộ ảnh Pastel Nàng Thơ tại MOOD Studio',
          status: 'PUBLISHED',
          displayOrder: 1
        },
        {
          conceptId: concept2._id,
          imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1000&q=80',
          publicId: 'sample_traditional_1',
          caption: 'Ảnh Cổ Trang Việt Phục thanh nhã',
          status: 'PUBLISHED',
          displayOrder: 2
        },
        {
          conceptId: concept3._id,
          imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80',
          publicId: 'sample_portrait_1',
          caption: 'Chân dung nghệ thuật biểu cảm',
          status: 'PUBLISHED',
          displayOrder: 3
        }
      ]);

      console.log('[SEED] Sample development data seeded successfully.');
    }
  } catch (error) {
    console.error('[SEED] Error seeding data:', error);
  } finally {
    await disconnectDB();
    console.log('[SEED] Finished.');
  }
}

runSeed();
