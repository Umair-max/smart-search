import RegistrationHeader from "@/components/RegistrationHeader";
import RegistrationText from "@/components/RegistrationText";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AppButton from "../../components/AppButton";
import FormInput from "../../components/FormInput";
import ScreenComponent from "../../components/ScreenComponent";
import Typo from "../../components/Typo";
import colors from "../../config/colors";
import { height, spacingH, spacingX, spacingY } from "../../config/spacing";
import { signupSchema } from "../../schemas/schemas";
import { useAuthStore } from "../../store/authStore";
import { SignupTypes } from "../../types/registerTypes";
import { normalizeY } from "../../utils/normalize";

function Signup() {
  const signupUser = useAuthStore((state) => state.signupUser);
  const loading = useAuthStore((state) => state.loading);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupTypes>({
    resolver: zodResolver(signupSchema),
    defaultValues: {},
  });

  const onSubmit = async (data: SignupTypes) => {
    signupUser(data, () => {
      router.back();
    });
  };

  return (
    <ScreenComponent>
      <RegistrationHeader />
      <View style={styles.container}>
        <KeyboardAwareScrollView
          style={styles.scrollContainerStyle}
          showsVerticalScrollIndicator={false}
        >
          <RegistrationText
            title={"Sign Up"}
            body={"Please register now to get started"}
          />
          <FormInput
            control={control}
            name="email"
            label={""}
            placeholder={"Email"}
            index={1}
            inputMode="email"
            inputProps={{
              autoCapitalize: "none",
              keyboardType: "email-address",
            }}
            image={require("@/assets/images/email.png")}
          />

          <FormInput
            control={control}
            name="password"
            label={""}
            placeholder={"Password"}
            index={2}
            password
            image={require("@/assets/images/lock.png")}
          />

          <AppButton
            onPress={handleSubmit(onSubmit)}
            label={"Sign up"}
            style={{ marginTop: normalizeY(35) }}
            loading={loading}
          />
          <View style={styles.footer}>
            <Typo size={15} style={styles.footerTxt}>
              Already have an account?
            </Typo>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ padding: spacingY._5 }}
            >
              <Typo style={styles.signInText}>Sign in</Typo>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </View>
    </ScreenComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginTop: spacingH.registerMarginTop,
    zIndex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: spacingY._20,
  },
  scrollContainerStyle: {
    paddingHorizontal: spacingX._20,
    paddingBottom: height * 0.05,
    paddingTop: spacingY._15,
  },
  signInText: {
    color: colors.primary,
    fontWeight: "600",
  },
  footerTxt: {
    color: colors.textGray,
    fontWeight: "300",
  },
  footer: {
    marginVertical: "12%",
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
  },
});

export default Signup;
