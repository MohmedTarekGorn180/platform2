
import { supabase } from "./supabase-client.js";

const form = document.getElementById("register-form");
const submitButton = document.getElementById("register-submit");

if (!form) {
  console.error("لم يتم العثور على register-form");
} else {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // منع الضغط المتكرر أثناء التسجيل
    if (submitButton.disabled) return;

    const firstName = document
      .getElementById("reg-firstname").value.trim();

    const lastName = document
      .getElementById("reg-lastname").value.trim();

    const username = document
      .getElementById("reg-username").value.trim();

    const email = document
      .getElementById("reg-email").value.trim();

    const password = document
      .getElementById("reg-password").value;

    const confirmPassword = document
      .getElementById("reg-confirm").value;

    const consent = document
      .getElementById("reg-consent").checked;

    const fullName = `${firstName} ${lastName}`.trim();

    function showError(id, message) {
      const errorBox = document.getElementById(id);
      if (!errorBox) return;

      const text = errorBox.querySelector(".field__error-text");
      if (text) text.textContent = message;

      errorBox.style.display = message ? "flex" : "none";
    }

    // مسح رسائل الأخطاء السابقة
    [
      "reg-firstname-error",
      "reg-lastname-error",
      "reg-username-error",
      "reg-email-error",
      "reg-password-error",
      "reg-confirm-error",
      "reg-consent-error"
    ].forEach((id) => showError(id, ""));

    let hasError = false;

    if (!firstName) {
      showError("reg-firstname-error", "اكتب اسمك الأول.");
      hasError = true;
    }

    if (!lastName) {
      showError("reg-lastname-error", "اكتب اسم العائلة.");
      hasError = true;
    }

    if (!/^[A-Za-z0-9]+$/.test(username)) {
      showError(
        "reg-username-error",
        "استخدم الحروف الإنجليزية والأرقام فقط، بدون مسافات."
      );
      hasError = true;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("reg-email-error", "اكتب بريدًا إلكترونيًا صحيحًا.");
      hasError = true;
    }

    if (
      password.length < 8 ||
      !/[A-Za-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      showError(
        "reg-password-error",
        "كلمة المرور لازم تكون 8 أحرف على الأقل، وتحتوي على حرف ورقم."
      );
      hasError = true;
    }

    if (password !== confirmPassword) {
      showError(
        "reg-confirm-error",
        "كلمتا المرور غير متطابقتين."
      );
      hasError = true;
    }

    if (!consent) {
      showError(
        "reg-consent-error",
        "لازم توافق على الشروط وسياسة الخصوصية للمتابعة."
      );
      hasError = true;
    }

    if (hasError) return;

    const label = submitButton.querySelector(".btn__label");
    const originalLabel = label?.textContent || "إنشاء الحساب";

    submitButton.disabled = true;
    if (label) label.textContent = "جاري إنشاء الحساب...";

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username
          }
        }
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error("لم يتم تأكيد إنشاء الحساب. حاول مرة أخرى.");
      }

      // لا نُدخل سجل profiles يدويًا؛ الـ Trigger يتولى ذلك.
      if (!data.session) {
        alert(
          "تم إرسال طلب إنشاء الحساب. راجع بريدك الإلكتروني لتأكيد الحساب إذا كان التأكيد مطلوبًا."
        );
      } else {
        alert("تم إنشاء الحساب بنجاح!");
      }

      form.reset();

    } catch (error) {
      console.error("Supabase registration error:", error);

      // لا نعرض تفاصيل تقنية داخل واجهة الطالب
      const message =
        error.message?.toLowerCase().includes("duplicate") ||
        error.message?.toLowerCase().includes("unique")
          ? "اسم المستخدم مستخدم بالفعل. جرّب اسمًا آخر."
          : error.message?.toLowerCase().includes("already registered")
            ? "هذا البريد الإلكتروني مسجل بالفعل."
            : "تعذر إنشاء الحساب. راجع البيانات وحاول مرة أخرى.";

      alert(message);

    } finally {
      submitButton.disabled = false;
      if (label) label.textContent = originalLabel;
    }
  });
}
