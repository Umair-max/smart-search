import RegistrationHeader from "@/components/RegistrationHeader";
import RegistrationText from "@/components/RegistrationText";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import React from "react";
import { useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import AppButton from "../../components/AppButton";
import FormInput from "../../components/FormInput";
import ScreenComponent from "../../components/ScreenComponent";
import Typo from "../../components/Typo";
import colors from "../../config/colors";
import { height, spacingH, spacingX, spacingY } from "../../config/spacing";
import { signinSchema } from "../../schemas/schemas";
import { useAuthStore } from "../../store/authStore";
import { SigninTypes } from "../../types/registerTypes";

function Login() {
  const signinUser = useAuthStore((state) => state.signinUser);
  const loading = useAuthStore((state) => state.loading);
  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninTypes>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SigninTypes) => {
    signinUser(data, () => {
      router.replace("/(app)/(tabs)/home");
    });
  };

  return (
    <ScreenComponent style={{ backgroundColor: "white" }}>
      <RegistrationHeader />
      <View style={styles.container}>
        <KeyboardAvoidingView behavior="padding">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainerStyle}
          >
            <RegistrationText
              title={"Log in"}
              body={"Please login with your account to continue"}
            />
            <FormInput
              control={control}
              name="email"
              label={""}
              placeholder={"Email"}
              image={require("@/assets/images/email.png")}
              index={0}
              inputMode="email"
              inputProps={{
                autoCapitalize: "none",
                keyboardType: "email-address",
              }}
            />

            <FormInput
              control={control}
              name="password"
              label={""}
              placeholder={"Password"}
              index={1}
              password
              image={require("@/assets/images/lock.png")}
            />

            <TouchableOpacity onPress={() => router.push("/forgot-password")}>
              <View style={styles.forgotButton}>
                <Typo style={{ fontWeight: "500" }}>Forgot Password?</Typo>
              </View>
            </TouchableOpacity>

            <AppButton
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              label={"Log in"}
            />

            <View style={styles.footer}>
              <Typo size={15} style={styles.footerTxt}>
                Don't have an account
              </Typo>
              <TouchableOpacity
                onPress={() => router.push("/signup")}
                style={{ padding: spacingY._5 }}
              >
                <Typo style={styles.signupTxt}>Sign up</Typo>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  footerTxt: {
    color: colors.textGray,
    fontWeight: "300",
  },
  signupTxt: {
    color: colors.primary,
    fontWeight: "600",
  },
  remeberButton: {
    marginStart: spacingX._5,
    gap: spacingX._5,
    alignItems: "center",
    marginTop: spacingY._20,
    flexDirection: "row",
  },
  checkBox: {
    height: spacingY._20,
    width: spacingY._20,
    borderWidth: 1.5,
    borderRadius: spacingY._5,
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    marginTop: "15%",
    alignSelf: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  forgotButton: {
    padding: spacingX._5,
    marginRight: -spacingX._5,
    marginBottom: spacingY._30,
    alignSelf: "flex-end",
  },
  scrollContainerStyle: {
    paddingHorizontal: spacingX._20,
    paddingBottom: height * 0.2,
    paddingTop: spacingY._15,
  },
});

export default Login;
