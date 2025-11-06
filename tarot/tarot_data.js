// Đây là tệp cơ sở dữ liệu ý nghĩa 78 lá bài Tarot.
// Bạn chỉ cần cập nhật nội dung ý nghĩa, từ khóa, xuôi, ngược trong tệp này.
// QUAN TRỌNG: Tên lá bài (ví dụ "0 - The Fool") phải khớp 100% với tên trong file index.html.

const cardMeanings = {

    // === BỘ ẨN CHÍNH (MAJOR ARCANA) ===
    "0 - The Fool": {
        keywords: "Khởi đầu mới, ngây thơ, phiêu lưu, rủi ro, niềm tin vào vũ trụ",
        xuoi: "Bạn đang đứng trước một khởi đầu hoàn toàn mới. Đây là lúc để tin tưởng vào bản thân và vũ trụ, ngay cả khi bạn chưa biết rõ con đường phía trước. Hãy đón nhận cuộc phiêu lưu với một trái tim rộng mở và tinh thần lạc quan.",
        nguoc: "Sự liều lĩnh, ngây thơ thái quá, hoặc nỗi sợ hãi cản bước. Bạn có thể đang hành động thiếu suy nghĩ, hoặc ngược lại, bạn đang quá sợ hãi để bắt đầu một điều gì đó mới. Hãy cân nhắc kỹ lưỡng trước khi 'nhảy' (take the leap)."
    },
    "I - The Magician": {
        keywords: "Sức mạnh ý chí, hiện thực hóa, tài năng, nguồn lực, hành động",
        xuoi: "Bạn có tất cả các công cụ và nguồn lực cần thiết để biến ý tưởng thành hiện thực. Đây là lúc để hành động, tập trung ý chí và sử dụng tài năng của mình. Bạn là người kiến tạo thực tại của chính mình.",
        nguoc: "Lạm dụng quyền lực, lừa dối, thao túng, hoặc thiếu tự tin vào khả năng. Có thể bạn đang không sử dụng hết tiềm năng của mình, hoặc sử dụng chúng cho mục đích không đúng đắn."
    },
    "II - The High Priestess": {
        keywords: "Trực giác, bí ẩn, tiềm thức, sự thụ động, tri thức nội tâm",
        xuoi: "Hãy lắng nghe tiếng nói bên trong của bạn. Đây là thời điểm để đi sâu vào tiềm thức và tin tưởng vào trực giác. Có những bí mật và tri thức đang chờ bạn khám phá, nhưng chúng không ở bên ngoài, mà ở bên trong.",
        nguoc: "Che giấu cảm xúc, phớt lờ trực giác, bí mật bị tiết lộ. Có thể bạn đang mất kết nối với tiếng nói nội tâm của mình, hoặc có điều gì đó mờ ám đang diễn ra."
    },
    "III - The Empress": {
        keywords: "Sự nuôi dưỡng, dồi dào, sinh sôi, nữ tính, vẻ đẹp, thiên nhiên",
        xuoi: "Đây là năng lượng của sự sáng tạo, sự dồi dào và sự nuôi dưỡng (cả về thể chất lẫn tinh thần). Hãy kết nối với thiên nhiên, chăm sóc bản thân và những người xung quanh. Đây là thời điểm tuyệt vời cho sự sáng tạo và phát triển.",
        nguoc: "Sự bế tắc sáng tạo, sự phụ thuộc, ngột ngạt, hoặc quá nuông chiều bản thân. Có thể bạn đang chăm sóc người khác quá nhiều mà quên mất mình, hoặc ngược lại."
    },
    "IV - The Emperor": {
        keywords: "Quyền lực, cấu trúc, sự ổn định, lãnh đạo, lý trí, người cha",
        xuoi: "Nắm lấy quyền kiểm soát. Đây là lúc để thiết lập trật tự, kỷ luật và cấu trúc. Hãy sử dụng lý trí và khả năng lãnh đạo của bạn để xây dựng một nền tảng vững chắc cho tương lai. Bạn là người nắm quyền.",
        nguoc: "Sự cứng nhắc, độc đoán, lạm dụng quyền lực, hoặc thiếu kiểm soát. Bạn có thể đang quá kiểm soát hoặc ngược lại, đang mất kiểm soát tình hình. Hãy tìm sự cân bằng."
    },
    // ... [BẠN CẦN TỰ THÊM Ý NGHĨA CHO CÁC LÁ TIẾP THEO] ...
    // ... The Hierophant, The Lovers, ...
    "XXI - The World": {
        keywords: "Hoàn thành, trọn vẹn, thành tựu, kết thúc một chu kỳ",
        xuoi: "Bạn đã hoàn thành một chu kỳ quan trọng trong cuộc đời. Đây là lúc để ăn mừng thành tựu và sự trọn vẹn bạn đã đạt được. Bạn đã học được bài học của mình và sẵn sàng cho một hành trình mới.",
        nguoc: "Sự dở dang, thiếu trọn vẹn, không thể kết thúc. Có thể bạn đang cảm thấy bế tắc ngay trước vạch đích, hoặc có một bài học bạn chưa hoàn thành."
    },

    // === BỘ GẬY (WANDS) ===
    "Ace of Wands": {
        keywords: "Khởi đầu mới (sáng tạo), cảm hứng, đam mê, tiềm năng",
        xuoi: "Một tia lửa sáng tạo mới đang bùng lên. Đây là một cơ hội mới, một dự án đầy cảm hứng hoặc một nguồn năng lượng đam mê mới. Hãy nắm bắt lấy nó.",
        nguoc: "Thiếu cảm hứng, trì hoãn, một khởi đầu thất bại, bế tắc sáng tạo."
    },
    "Two of Wands": {
        keywords: "Lên kế hoạch, quyết định, tầm nhìn xa, rời khỏi vùng an toàn",
        xuoi: "Bạn đang đứng ở ngã ba đường, nhìn về tương lai. Đây là lúc để lên kế hoạch chi tiết cho bước tiếp theo. Bạn có một tầm nhìn, và bây giờ là lúc quyết định xem có nên rời khỏi vùng an toàn để theo đuổi nó hay không.",
        nguoc: "Sợ hãi thay đổi, kế hoạch thất bại, thiếu tầm nhìn. Bạn có thể đang bám víu lấy quá khứ hoặc không dám thực hiện bước đi tiếp theo."
    },
    "Page of Wands": {
        keywords: "Sáng tạo, nhiệt huyết, khám phá, thông điệp mới, tia lửa ban đầu",
        xuoi: "Đại diện cho một người trẻ tuổi (hoặc một người có tinh thần trẻ) đầy nhiệt huyết, đam mê và sáng tạo. Bạn đang ở ngưỡng cửa của một cuộc phiêu lưu mới, một dự án mới, hoặc một ý tưởng mới. Năng lượng này thúc đẩy bạn khám phá và đừng ngại thể hiện bản thân.",
        nguoc: "Khi lá bài này đảo ngược, nó có thể chỉ ra sự trì hoãn, thiếu định hướng, hoặc một ý tưởng bị dập tắt. Có thể bạn đang cảm thấy bế tắc, hoặc năng lượng sáng tạo của bạn đang bị cản trở bởi nỗi sợ hãi hoặc sự thiếu tự tin."
    },
    // ... [BẠN TỰ THÊM CÁC LÁ WANDS CÒN LẠI] ...

    // === BỘ CỐC (CUPS) ===
    "Ace of Cups": {
        keywords: "Tình yêu mới, cảm xúc dâng trào, trực giác, sự sáng tạo, lòng trắc ẩn",
        xuoi: "Một khởi đầu mới về mặt cảm xúc. Đây có thể là một mối quan hệ mới, sự ra đời của một tình bạn sâu sắc, hoặc sự thức tỉnh về mặt tinh thần. Trái tim bạn đang rộng mở để cho đi và nhận lại tình yêu thương.",
        nguoc: "Cảm xúc bị dồn nén, bị chặn lại. Bạn có thể đang tự từ chối cảm xúc của mình hoặc gặp khó khăn trong việc kết nối với người khác. Đây là lời nhắc nhở hãy tự chăm sóc bản thân về mặt cảm xúc trước."
    },
    // ... [BẠN TỰ THÊM CÁC LÁ CUPS CÒN LẠI] ...

    // === BỘ KIẾM (SWORDS) ===
    "Ace of Swords": {
        keywords: "Sự thật, rõ ràng, đột phá, ý tưởng mới, sức mạnh lý trí",
        xuoi: "Một 'khoảnh khắc Eureka!'. Một sự thật mới được phơi bày, mang lại sự rõ ràng tuyệt đối. Đây là một ý tưởng đột phá hoặc một quyết định dứt khoát.",
        nguoc: "Sự nhầm lẫn, thiếu rõ ràng, quyết định sai lầm, hoặc lạm dụng sức mạnh lý trí (quá khắc nghiệt)."
    },
    // ... [BẠN TỰ THÊM CÁC LÁ SWORDS CÒN LẠI] ...

    // === BỘ TIỀN (PENTACLES) ===
    "Ace of Pentacles": {
        keywords: "Khởi đầu mới (vật chất), cơ hội, thịnh vượng, ổn định",
        xuoi: "Một cơ hội mới về tài chính, công việc, hoặc sức khỏe. Đây là hạt giống của sự thịnh vượng và ổn định vật chất. Một món quà từ vũ trụ.",
        nguoc: "Cơ hội bị bỏ lỡ, quản lý tài chính kém, đầu tư tồi, hoặc tham lam."
    }
    // ... [BẠN TỰ THÊM CÁC LÁ PENTACLES CÒN LẠI] ...
};
