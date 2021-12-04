package com.junocoding.bank.controller

import com.junocoding.bank.controller.model.TransactionModel
import com.junocoding.bank.controller.model.OverviewTransactionModel
import com.junocoding.bank.controller.model.convertToDBModel
import com.junocoding.bank.controller.model.convertToOverviewTransactionModel
import com.junocoding.bank.repository.TransferRepository
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/transfer")
class TransferController(val repository: TransferRepository) {

    @PostMapping("/new")
    fun newTransfer(@RequestBody transactionModel: TransactionModel) {
        repository.save(transactionModel.convertToDBModel())
    }

    @GetMapping("/all")
    fun getAllTransfers(): List<OverviewTransactionModel> {
        return repository.findAll().map { it.convertToOverviewTransactionModel() }
    }

}