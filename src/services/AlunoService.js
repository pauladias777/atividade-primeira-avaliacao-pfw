const prisma = require("../databases/prisma");
const AlunoInvalidoError = require("../errors/AlunoInvalidoError");
const AlunoNaoEncontradoError = require("../errors/AlunoNaoEncontradoError");

class AlunoService{

    async findMany(page, pageSize, orderBy, order){

        orderBy = orderBy || "nome";
        order = order || "asc";

        if (order !== "asc" && order !== "desc"){
        throw new AlunoInvalidoError("a ordem deve ser asc ou desc", 400);
        }
        const alunos = await prisma.aluno.findMany({
            skip: (page-1)*pageSize,
            take: Number(pageSize),
            orderBy: {
                [orderBy]: order
            }
        });

        const total = await prisma.aluno.count();
        return { alunos, total };
    }
    async findById(id){
        const aluno = await prisma.aluno.findUnique({
            where: {
                id: Number(id)
            }
        });

        if(!aluno){
            throw new AlunoNaoEncontradoError();
        }
        return aluno;
    }
    


    async update(id, dados){
        const aluno = await prisma.aluno.findUnique({
            where: {
                id: Number(id)
            }
        })

        if(!aluno){
            throw new AlunoNaoEncontradoError();
        }

        if(!dados.nome || !dados.email){
            throw new AlunoInvalidoError();
        }

        let alunoAtualizado;
        try{
            alunoAtualizado = await prisma.aluno.update({
                where:{
                    id: Number(id)
                },
                data:dados
            });
        }catch(error){
            if(error.code  ==="P2002"){
                throw new AlunoInvalidoError("esse email já possui cadastro", 400);
            }
            throw error;
        }

        return alunoAtualizado;
    }
    async create(aluno){
        const {nome, email} = aluno;
        if(!nome || !email){
            throw new AlunoInvalidoError();
        }

        const novoAluno = await prisma.aluno.create({data: aluno});

        return novoAluno;
    }
}

module.exports = new AlunoService();