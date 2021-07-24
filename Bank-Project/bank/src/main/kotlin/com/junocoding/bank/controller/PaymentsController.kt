package com.junocoding.bank.controller

import com.junocoding.bank.model.Payment
import com.junocoding.bank.repository.PaymentsRepository
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/payments")
class PaymentsController(val repository: PaymentsRepository) {

    @PostMapping("/submit")
    fun submitPayment(@RequestBody payment: Payment) {
        repository.save(payment)
    }

    @GetMapping("/all")
    fun getAllPayments(): List<Payment> {
        return repository.findAll().toList()
    }

}