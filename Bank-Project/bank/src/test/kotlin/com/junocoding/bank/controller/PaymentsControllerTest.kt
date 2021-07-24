package com.junocoding.bank.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.junocoding.bank.model.Payment
import com.junocoding.bank.repository.PaymentsRepository
import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import java.util.*
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultHandlers.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*


@WebMvcTest
class PaymentsControllerTest(@Autowired val mockMvc: MockMvc) {

    @MockkBean
    private lateinit var paymentsRepository: PaymentsRepository

    @Test
    fun `should get payment with success`() {
        val payment = Payment(
            value = 1.50,
            date = Date(),
            description = "store 1",
            id = UUID.randomUUID(),
            targetAccountId = 123
        )

        every { paymentsRepository.findAll() } returns listOf(payment)

        mockMvc.perform(get("/payments/all").accept(MediaType.APPLICATION_JSON))
            .andDo(print())
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("\$.[0].description").value("store 1"))
    }

    @Test
    fun `should submit payment with success`() {
        val payment = Payment(
            value = 1.50,
            description = "store 1",
            targetAccountId = 123
        )

        every { paymentsRepository.save(any()) } returns payment

        mockMvc.perform(post("/payments/submit")
            .content(ObjectMapper().writeValueAsString(payment))
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
            .andDo(print())
            .andExpect(status().isOk)
    }

    @Test
    fun `should return a bad request error`() {
        mockMvc.perform(post("/payments/submit")
            .contentType(MediaType.APPLICATION_JSON)
            .accept(MediaType.APPLICATION_JSON))
            .andDo(print())
            .andExpect(status().is4xxClientError)
    }

}