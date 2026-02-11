import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const defaultQuestions = [
  "ما هو مفهوم الرول بلاي (RolePlay) من وجهة نظرك؟",
  "كيف تتصرف إذا تعرضت لموقف غير عادل داخل السيرفر؟",
  "ما هو الفرق بين IC (In Character) و OOC (Out of Character)؟",
  "كيف ستتعامل مع موقف يخالف فيه لاعب آخر قوانين السيرفر؟",
  "ما هي أهم القيم التي يجب أن يتحلى بها لاعب الرول بلاي؟",
  "كيف يمكنك المساهمة في تحسين تجربة اللعب للجميع؟",
  "ما هو Metagaming؟ وكيف يمكن تجنبه؟",
  "ما هو Powergaming؟ وما هي أمثلة عليه؟",
  "كيف تتصرف في حالة وجود خلاف مع لاعب آخر خارج اللعبة؟",
  "ما الذي يميز سيرفرات الرول بلاي عن السيرفرات العادية؟"
]

async function main() {
  console.log('🌱 بدء عملية Seed...')

  // حذف الأسئلة القديمة
  await prisma.question.deleteMany()
  console.log('✅ تم حذف الأسئلة القديمة')

  // إضافة الأسئلة الافتراضية
  for (let i = 0; i < defaultQuestions.length; i++) {
    await prisma.question.create({
      data: {
        question: defaultQuestions[i],
        isActive: true,
        order: i + 1
      }
    })
  }

  console.log(`✅ تم إضافة ${defaultQuestions.length} سؤال`)
  console.log('🎉 اكتملت عملية Seed بنجاح!')
}

main()
  .catch((e) => {
    console.error('❌ خطأ في عملية Seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
